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
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True          # read: queryset scoping already gates to members
        if obj.user == request.user:
            return True          # write: the author
        return UserBoard.objects.filter(
            board=obj.task.board, user=request.user, role="owner"
        ).exists()

class AssignmentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # obj is the AssignedTask being deleted
        if obj.user == request.user:
            return True  # unassign yourself
        membership = UserBoard.objects.filter(
            board=obj.task.board, user=request.user
        ).first()
        return membership is not None and membership.role == "owner"