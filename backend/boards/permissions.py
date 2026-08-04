from rest_framework import permissions
from .models import UserBoard

class BoardMemberPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return UserBoard.objects.filter(board = obj, user = request.user).exists() # check if the associative table userboard has a connection of the two (given board and request user)
    
class TaskAndColumnBoardMemberPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        board = obj.board
        return UserBoard.objects.filter(board = board, user = request.user).exists()    

class CommentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated) # setting this class on the viewset overrides the global IsAuthenticated default

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True          # read: queryset scoping already gates to members
        return obj.user == request.user   # write: author only