from django.shortcuts import render
from django.contrib.auth import get_user_model
from boards.serializers import BoardSerializer, TaskSerializer, AssignedTaskSerializer, UserBoardSerializer, ColumnSerializer, CreateUserSerializer, BoardDetailSerializer, CommentSerializer, TaskDetailSerializer
from rest_framework import viewsets, generics
from rest_framework.response import Response
from . models import Board, Task, Column, UserBoard, AssignedTask, Comment
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from .permissions import BoardMemberPermission, TaskAndColumnBoardMemberPermission, CommentPermission
from rest_framework.decorators import action
from rest_framework import status
from .ai import draft_ticket

class UserBoardViewSet(viewsets.ModelViewSet):
    serializer_class = UserBoardSerializer
    queryset = UserBoard.objects.all()

class AssignedTaskViewSet(viewsets.ModelViewSet):
    serializer_class = AssignedTaskSerializer
    queryset = AssignedTask.objects.all()

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    queryset = Board.objects.all()
    permission_classes = [BoardMemberPermission]

    def get_queryset(self):
        return Board.objects.filter(userboard__user = self.request.user) # double underscore lookup "__" de la Board la UserBoard la user
    
    def perform_create(self, serializer):
        board = serializer.save()
        UserBoard.objects.create(board = board, user = self.request.user, role='owner')

    def get_serializer_class(self): # return diff serializer based on actual request. if details are needed return the columns as well (seperate Detailed serializer) else return flat one
        if self.action == "retrieve":
            return BoardDetailSerializer
        return BoardSerializer
    

class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    queryset = Column.objects.all()
    permission_classes = [TaskAndColumnBoardMemberPermission]
    
    def get_queryset(self):
        return Column.objects.filter(board__userboard__user = self.request.user) # column -> board -> userboard -> user = current request's user

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    permission_classes = [TaskAndColumnBoardMemberPermission]
    
    def get_queryset(self):
        return Task.objects.filter(board__userboard__user = self.request.user) 

    def get_serializer_class(self): # return diff serializer based on actual request. if details are needed return the columns as well (seperate Detailed serializer) else return flat one
        if self.action == "retrieve":
            return TaskDetailSerializer
        return TaskSerializer

    @action(detail=False, methods=["post"])
    def draft(self, request):
        user_input = request.data.get("input", "").strip()
        if not user_input:
            return Response(
                {"error": "No input provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = draft_ticket(user_input)
        except RuntimeError:
            return Response(
                {"error": "AI service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ValueError:
            return Response(
                {"error": "Could not draft a ticket from that input"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        return Response(result)

class CreateUserView(generics.CreateAPIView): # register view
    serializer_class = CreateUserSerializer
    queryset = get_user_model().objects.all()
    permission_classes = [AllowAny]

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()
    permission_classes = [CommentPermission]

    def get_queryset(self):
        qs = Comment.objects.filter(task__board__userboard__user=self.request.user)
        task_id = self.request.query_params.get("task")
        if task_id is not None:
            qs = qs.filter(task_id=task_id)
        return qs

    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        is_member = UserBoard.objects.filter(
            board=task.board, user=self.request.user
        ).exists()
        if not is_member:
            raise PermissionDenied("You are not a member of this board")
        serializer.save(user=self.request.user)