from django.urls import path
from . import views

urlpatterns = [
    path('add-offer-sd/', views.addOfferSessionDescription, name='add_offer_sd'),
    path('add-answer-sd/', views.addAnswerSessionDescription, name='add_answer_sd'),
    path('get-offer-sd/', views.getOfferSessionDescription, name='get_offer_sd'),
    path('get-answer-sd/', views.getAnswerSessionDescription, name='get_answer_sd'),
    path('add-ice-candidate/', views.addIceCandidate, name='add_ice_candidate'),
    path('get-offer-ice-candidates/', views.getOfferIceCandidates, name='get_offer_ice_candidates'),
    path('get-answer-candidates/', views.getAnswerCandidates, name='get_answer_candidates'),
]
