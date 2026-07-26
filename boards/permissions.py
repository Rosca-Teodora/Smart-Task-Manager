from rest_framework import permissions
from .models import UserBoard

class BoardMemberPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return UserBoard.objects.filter(board = obj, user = request.user).exists() # check if the associative table userboard has a connection of the two (given board and request user)
    
class TaskAndColumnBoardMemberPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        board = obj.board
        return UserBoard.objects.filter(board = board, user = request.user).exists()    
