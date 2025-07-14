from django.db import models

class Session(models.Model):
    hashpass = models.CharField(max_length=255, unique=True,
                                help_text="Hashed password for the session.")

    def __str__(self):
        return f"Session {self.id}"

class Client(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE,
                                related_name='clients',
                                help_text="The session this client belongs to.")

    def __str__(self):
        return f"Client {self.id} (Session: {self.session.id})"

class SessionDescription(models.Model):
    client = models.OneToOneField(Client, on_delete=models.CASCADE,
                                  related_name='session_description',
                                  help_text="The client this session description belongs to.")
    body = models.TextField(help_text="The Session Description Protocol (SDP) body.")

    def __str__(self):
        return f"SessionDescription for Client {self.client.id}"

class IceCandidate(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE,
                               related_name='ice_candidates',
                               help_text="The client this ICE candidate belongs to.")
    body = models.TextField(help_text="The ICE candidate body.")

    def __str__(self):
        return f"IceCandidate for Client {self.client.id}"
