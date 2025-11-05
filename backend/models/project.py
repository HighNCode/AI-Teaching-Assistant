from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class LessonPlan(BaseModel):
    id: Optional[str] = Field(alias='_id', default=None)
    projectId: str
    fileName: str
    content: str
    exportFormat: str = "pdf"

class Worksheet(BaseModel):
    id: Optional[str] = Field(alias='_id', default=None)
    projectId: str
    fileName: str
    content: str
    exportFormat: str = "pdf"
    
class ParentUpdate(BaseModel):
    id: Optional[str] = Field(alias='_id', default=None)
    projectId: str
    studentName: str
    fileName: str
    draftText: str

class Project(BaseModel):
    id: Optional[str] = Field(alias='_id', default=None)
    name: str
    userId: str
    lessonPlans: List[LessonPlan] = []
    worksheets: List[Worksheet] = []
    parentUpdates: List[ParentUpdate] = []

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class CreateProject(BaseModel):
    name: str


    