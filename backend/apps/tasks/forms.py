from django import forms

from .models import Task


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'status', 'priority']
        widgets = {
            'due_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }

    def clean(self):
        cleaned_data = super().clean()
        if self.instance and self.instance.pk and self.instance.status == 'done':
            if 'title' in self.changed_data:
                self.add_error('title', 'Cannot modify title of a completed task.')
            if 'description' in self.changed_data:
                self.add_error('description', 'Cannot modify description of a completed task.')
        return cleaned_data
