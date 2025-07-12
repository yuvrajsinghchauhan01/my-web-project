from django.urls import path
from . import views

urlpatterns = [
    path('detect-circles/', views.detect_circles, name='detect_circles'),
] 