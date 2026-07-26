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

    def get_queryset(self):
        return Board.objects.filter(userboard__user = self.request.user) # double underscore lookup "__" de la Board la UserBoard la user

class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    queryset = Column.objects.all()
    
    def get_queryset(self):
        return Column.objects.filter(board__userboard__user = self.request.user) # column -> board -> userboard -> user = current request's user

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    
    def get_queryset(self):
        return Task.objects.filter(board__userboard__user = self.request.user) 

class CreateUserView(generics.CreateAPIView): # register view
    serializer_class = CreateUserSerializer
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]