from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError

class Board(models.Model):
    name = models.CharField(max_length=100)
    created_date = models.DateTimeField(auto_now_add=True)
    key = models.CharField(max_length=5, unique=True)

    def __str__(self):
        return f"{self.key}-{self.name}"

    def save(self, *args, **kwargs):
        self.key = self.key.upper()
        super().save(*args, **kwargs)

class UserBoard(models.Model):
    role = models.CharField(max_length=30)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "board"], name="unique_user_per_board")
        ]

    def __str__(self):
        return f"{self.user} on {self.board} ({self.role})"

    
class Column(models.Model): # things like: to do, done, bugs etc.
    name = models.CharField(max_length=50)
    position = models.IntegerField()

    board = models.ForeignKey(Board, on_delete=models.CASCADE) # deleting boards deletes evertything

    def __str__(self):
        return f"{self.name}"

class Task(models.Model):
    title = models.CharField(max_length=30)
    description = models.CharField(max_length=600)
    created_date = models.DateTimeField(auto_now_add=True)
    last_edited_date = models.DateTimeField(auto_now=True)
    deadline = models.DateTimeField(null=True, blank=True)
    number = models.IntegerField(default=1)
    position = models.FloatField()

    board = models.ForeignKey(Board, on_delete=models.CASCADE) # FK needed to not take columns/ statuses from any project, ony from current board
    status = models.ForeignKey(Column, on_delete=models.PROTECT) # error when deleting column with tasks inside 
    main_task = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="subtasks") # for subtask integration = adjacency list!!!

    def __str__(self):
        return f"{self.board.key}-{self.number}: {self.title}" 

    def clean(self): # keep only one level which is task-> subtask (no task->subtask->subtask->......)
        if self.main_task and self.main_task.main_task:
            raise ValidationError("Cannot give subtasks to another subtask")
        
    def save(self, *args, **kwargs):
        if self._state.adding: # model isnt saved yet
            with transaction.atomic():
                max_number = (
                    Task.objects.select_for_update()
                    .filter(board=self.board) # filter needed bc it should take tasks from a given board not global
                    .aggregate(largest=models.Max("number"))["largest"]
                )
                self.number = (max_number or 0) + 1
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["board", "number"], name="unique_task_number_for_board")
        ]

class AssignedTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="assignments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_tasks")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["task", "user"], name="unique_assignee_per_task")
        ]

    def __str__(self):
        return f"{self.user}-{self.task}"

