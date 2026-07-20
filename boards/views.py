from django.shortcuts import render
from boards.serializers import BoardSerializer, TaskSerializer, AssignedTaskSerializer, UserBoardSerializer, ColumnSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from . models import Board, Task, Column, UserBoard, AssignedTask


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
