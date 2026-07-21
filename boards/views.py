from django.shortcuts import render
from django.contrib.auth import get_user_model
from boards.serializers import BoardSerializer, TaskSerializer, AssignedTaskSerializer, UserBoardSerializer, ColumnSerializer, CreateUserSerializer
from rest_framework import viewsets, generics
from rest_framework.response import Response
from . models import Board, Task, Column, UserBoard, AssignedTask 
from rest_framework.permissions import AllowAny

class UserBoardViewSet(viewsets.ModelViewSet):
    serializer_class = UserBoardSerializer
    queryset = UserBoard.objects.all()

class AssignedTaskViewSet(viewsets.ModelViewSet):
    serializer_class = AssignedTaskSerializer
    queryset = AssignedTask.objects.all()

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    queryset = Board.objects.all()

class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    queryset = Column.objects.all()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

class CreateUserView(generics.CreateAPIView):
    serializer_class = CreateUserSerializer
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]