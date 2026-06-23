import django.template.context

def context_copy(self):
    # Custom Context copy to bypass Python 3.14 super().__copy__() issues
    cls = self.__class__
    duplicate = cls.__new__(cls)
    duplicate.dicts = self.dicts[:]
    for key, val in self.__dict__.items():
        if key != "dicts":
            setattr(duplicate, key, val)
    return duplicate

django.template.context.Context.__copy__ = context_copy
django.template.context.RequestContext.__copy__ = context_copy
