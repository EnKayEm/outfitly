from django.urls import path
from . import views

urlpatterns = [
    path('clothes/upload/', views.upload_and_analyze_cloth, name='upload_cloth'),
    path('clothes/suggest/', views.suggest_outfit, name='suggest_outfit'),
]