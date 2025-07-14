import json
import ast # Used for safely evaluating Python literal strings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import hashlib

from .models import Session, Client, SessionDescription, IceCandidate

# Helper function to hash passwords consistently
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def parse_python_dict_string(s: str):
    """
    Safely parses a string that looks like a Python dictionary
    into a Python dictionary.
    """
    try:
        # Try to parse as valid JSON first (ideal case)
        return json.loads(s)
    except json.JSONDecodeError:
        # If it's not valid JSON, assume it's a Python literal
        try:
            return ast.literal_eval(s)
        except (ValueError, SyntaxError) as e:
            raise ValueError(f"String is neither valid JSON nor a Python literal: {s}. Error: {e}")


@api_view(['POST'])
def addOfferSessionDescription(request):
    """
    Handles adding an offer (SessionDescription) for a new session.
    A new Session and Client are created.
    """
    offer_body = request.data.get('offer')
    session_hashpass = request.data.get('hash_pass') # Hashed pass from offerer

    if not offer_body or not session_hashpass:
        return Response({"status": "error", "message": "Missing 'offer' or 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create a new Session
        session = Session.objects.create(hashpass=session_hashpass)

        # Create a new Client associated with this session (this is the offerer)
        client = Client.objects.create(session=session)

        # Create the SessionDescription (offer) for this client
        SessionDescription.objects.create(client=client, body=offer_body)

        return Response({
            "status": "success",
            "client_id": client.id,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        if 'UNIQUE constraint failed' in str(e):
             return Response({"status": "error", "message": "A session with this pass already exists."},
                            status=status.HTTP_409_CONFLICT)
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def addAnswerSessionDescription(request):
    """
    Handles adding an answer (SessionDescription) to an existing session.
    A new Client is created for the answerer.
    """
    answer_body = request.data.get('answer')
    raw_pass = request.data.get('pass') # Unhashed pass from the client

    if not answer_body or not raw_pass:
        return Response({"status": "error", "message": "Missing 'answer' or 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)

        # Create a new Client for the answerer
        client = Client.objects.create(session=session)

        # Create the SessionDescription (answer) for this client
        SessionDescription.objects.create(client=client, body=answer_body)

        return Response({
            "status": "success",
            "client_id": client.id,
        }, status=status.HTTP_201_CREATED)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def getOfferSessionDescription(request):
    """
    Retrieves the offer (SessionDescription) for a given session.
    This is typically called by the answerer.
    """
    raw_pass = request.data.get('pass') # Unhashed pass from the client

    if not raw_pass:
        return Response({"status": "error", "message": "Missing 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)
        offerer_client = session.clients.order_by('id').first()

        if not offerer_client:
            return Response({"status": "error", "message": "No offerer found for this session."},
                            status=status.HTTP_404_NOT_FOUND)

        offer_sdp = SessionDescription.objects.get(client=offerer_client)

        try:
            # Use the helper to parse the string into a Python dictionary
            parsed_offer_body = parse_python_dict_string(offer_sdp.body)
        except ValueError as e:
            return Response({"status": "error", "message": f"Malformed offer SDP body: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "status": "success",
            "offer": parsed_offer_body
        }, status=status.HTTP_200_OK)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except SessionDescription.DoesNotExist:
        return Response({"status": "error", "message": "Offer SessionDescription not found for this session."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def getAnswerSessionDescription(request):
    """
    Retrieves the answer (SessionDescription) for a given session.
    This is typically called by the offerer.
    """
    raw_pass = request.data.get('pass') # Unhashed pass from the client

    if not raw_pass:
        return Response({"status": "error", "message": "Missing 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)
        clients_in_session = session.clients.order_by('id')
        if clients_in_session.count() < 2:
            return Response({"status": "error", "message": "No answerer found yet for this session."},
                            status=status.HTTP_404_NOT_FOUND)

        answerer_client = clients_in_session[1]

        answer_sdp = SessionDescription.objects.get(client=answerer_client)

        try:
            # Use the helper to parse the string into a Python dictionary
            parsed_answer_body = parse_python_dict_string(answer_sdp.body)
        except ValueError as e:
            return Response({"status": "error", "message": f"Malformed offer SDP body: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({
            "status": "success",
            "answer": parsed_answer_body
        }, status=status.HTTP_200_OK)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except SessionDescription.DoesNotExist:
        return Response({"status": "error", "message": "Answer SessionDescription not found for this session."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def addIceCandidate(request):
    """
    Adds an ICE candidate for a specific client within a session.
    """
    client_id = request.data.get('client_id')
    raw_pass = request.data.get('pass') # Unhashed pass from the client
    candidate_body = request.data.get('candidate')

    if not client_id or not raw_pass or not candidate_body:
        return Response({"status": "error", "message": "Missing 'client_id', 'pass', or 'candidate' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)
        client = Client.objects.get(id=client_id, session=session)

        IceCandidate.objects.create(client=client, body=candidate_body)

        return Response({"status": "success"}, status=status.HTTP_201_CREATED)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except Client.DoesNotExist:
        return Response({"status": "error", "message": "Client not found or does not belong to this session."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def getOfferIceCandidates(request):
    """
    Retrieves ICE candidates for the client who initiated the offer in a session.
    """
    raw_pass = request.data.get('pass') # Unhashed pass from the client

    if not raw_pass:
        return Response({"status": "error", "message": "Missing 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)
        offerer_client = session.clients.order_by('id').first()

        if not offerer_client:
            return Response({"status": "error", "message": "No offerer found for this session."},
                            status=status.HTTP_404_NOT_FOUND)

        raw_candidates_bodies = IceCandidate.objects.filter(client=offerer_client).values_list('body', flat=True)
        
        parsed_candidates = []
        for body_string in raw_candidates_bodies:
            try:
                parsed_candidates.append(parse_python_dict_string(body_string))
            except ValueError as e:
                print(f"Warning: Malformed ICE candidate body encountered: {body_string}. Error: {e}")
               
        return Response({
            "status": "success",
            "candidates": parsed_candidates
        }, status=status.HTTP_200_OK)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def getAnswerIceCandidates(request):
    """
    Retrieves ICE candidates for the client who provided the answer in a session.
    """
    raw_pass = request.data.get('pass') # Unhashed pass from the client

    if not raw_pass:
        return Response({"status": "error", "message": "Missing 'pass' in request body."},
                        status=status.HTTP_400_BAD_REQUEST)

    session_hashpass = hash_password(raw_pass) # Hash the incoming pass

    try:
        session = Session.objects.get(hashpass=session_hashpass)
        clients_in_session = session.clients.order_by('id')
        if clients_in_session.count() < 2:
            return Response({"status": "error", "message": "No answerer found for this session yet."},
                            status=status.HTTP_404_NOT_FOUND)

        answerer_client = clients_in_session[1]

        raw_candidates_bodies = IceCandidate.objects.filter(client=answerer_client).values_list('body', flat=True)

        parsed_candidates = []
        for body_string in raw_candidates_bodies:
            try:
                parsed_candidates.append(parse_python_dict_string(body_string))
            except ValueError as e:
                print(f"Warning: Malformed ICE candidate body encountered: {body_string}. Error: {e}")

        return Response({
            "status": "success",
            "candidates": parsed_candidates
        }, status=status.HTTP_200_OK)

    except Session.DoesNotExist:
        return Response({"status": "error", "message": "Session not found with the provided pass."},
                        status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"status": "error", "message": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
