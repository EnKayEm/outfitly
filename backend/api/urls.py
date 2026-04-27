from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('clothes/upload/', views.upload_and_analyze_cloth, name='upload_cloth'),
    path('clothes/suggest/', views.suggest_outfit, name='suggest_outfit'),
]