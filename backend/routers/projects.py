import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.project import Project, CreateProject, LessonPlan, Worksheet, ParentUpdate
from database import get_db
from dependencies import get_current_user
from bson import ObjectId
from pydantic import BaseModel
from services.content_generator import generate_mock_content, generate_mock_parent_updates

router = APIRouter()

@router.post("/api/v1/projects", response_model=Project)
async def create_project(project_data: CreateProject, db=Depends(get_db), user: dict = Depends(get_current_user)):
    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    project = Project(
        name=project_data.name,
        userId=str(db_user["_id"])
    )
    result = db.projects.insert_one(project.dict(by_alias=True, exclude_none=True))
    created_project = db.projects.find_one({"_id": result.inserted_id})
    if created_project:
        created_project['id'] = str(created_project['_id'])
        del created_project['_id']
        return created_project
    raise HTTPException(status_code=500, detail="Failed to create project")

@router.get("/api/v1/projects", response_model=List[Project])
async def get_projects(db=Depends(get_db), user: dict = Depends(get_current_user)):
    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = str(db_user["_id"])
    projects_cursor = db.projects.find({"userId": user_id})
    projects = []
    for project_data in projects_cursor:
        project_id = str(project_data['_id'])
        project_data['id'] = project_id
        
        # Fetch related documents
        lesson_plans = list(db.lesson_plans.find({"projectId": project_id}))
        for lp in lesson_plans:
            lp['id'] = str(lp['_id'])
            del lp['_id']
        project_data['lessonPlans'] = lesson_plans

        worksheets = list(db.worksheets.find({"projectId": project_id}))
        for ws in worksheets:
            ws['id'] = str(ws['_id'])
            del ws['_id']
        project_data['worksheets'] = worksheets

        parent_updates = list(db.parent_updates.find({"projectId": project_id}))
        for pu in parent_updates:
            pu['id'] = str(pu['_id'])
            del pu['_id']
        project_data['parentUpdates'] = parent_updates
        
        del project_data['_id']
        projects.append(Project(**project_data))
    return projects

@router.get("/api/v1/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, db=Depends(get_db), user: dict = Depends(get_current_user)):
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Fetching project with ID: {project_id}")
    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(db_user["_id"])
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    project = db.projects.find_one({"_id": ObjectId(project_id), "userId": user_id})
    if project:
        project['id'] = str(project['_id'])
        del project['_id']
        
        lesson_plans = list(db.lesson_plans.find({"projectId": project_id}))
        logging.info(f"Found {len(lesson_plans)} lesson plans.")
        project['lessonPlans'] = []
        for lp in lesson_plans:
            lp['id'] = str(lp['_id'])
            del lp['_id']
            project['lessonPlans'].append(lp)

        worksheets = list(db.worksheets.find({"projectId": project_id}))
        logging.info(f"Found {len(worksheets)} worksheets.")
        project['worksheets'] = []
        for ws in worksheets:
            ws['id'] = str(ws['_id'])
            del ws['_id']
            project['worksheets'].append(ws)

        parent_updates = list(db.parent_updates.find({"projectId": project_id}))
        logging.info(f"Found {len(parent_updates)} parent updates.")
        project['parentUpdates'] = []
        for pu in parent_updates:
            pu['id'] = str(pu['_id'])
            del pu['_id']
            project['parentUpdates'].append(pu)
        
        logging.info(f"Returning project data: {project}")
        return project
    raise HTTPException(status_code=404, detail="Project not found or you do not have access")

@router.delete("/api/v1/projects/{project_id}", status_code=204)
async def delete_project(project_id: str, db=Depends(get_db), user: dict = Depends(get_current_user)):
    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(db_user["_id"])
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = db.projects.find_one({"_id": ObjectId(project_id), "userId": user_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or you do not have access")

    result = db.projects.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Project deleted successfully"}


class ParentUpdateParams(BaseModel):
    csv_data: str

@router.post("/api/v1/projects/{project_id}/generate-parent-updates")
async def generate_parent_updates(
    project_id: str,
    params: ParentUpdateParams,
    db=Depends(get_db),
    user: dict = Depends(get_current_user)
):
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Received request to generate parent updates for project_id: {project_id}")
    logging.info(f"CSV data received: {params.csv_data}")

    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        logging.error(f"User not found for email: {user_email}")
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(db_user["_id"])
    if not ObjectId.is_valid(project_id):
        logging.error(f"Invalid project ID format: {project_id}")
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = db.projects.find_one({"_id": ObjectId(project_id), "userId": user_id})
    if not project:
        logging.error(f"Project not found for project_id: {project_id} and user_id: {user_id}")
        raise HTTPException(status_code=404, detail="Project not found or you do not have access")
    
    logging.info(f"Project found: {project.get('name', 'Unnamed Project')}")

    updates = generate_mock_parent_updates(params.csv_data)
    logging.info(f"Generated {len(updates)} updates from content generator.")
    logging.info(f"Updates content: {updates}")

    if not updates:
        logging.warning("No updates were generated, returning empty list.")
        return {"updates": []}

    # Save the generated updates to the database
    inserted_ids = []
    for update_content in updates:
        student_name = "Unknown"  # default
        try:
            if update_content.startswith("Update for "):
                student_name = update_content.replace("Update for ", "").split(":")[0].strip()
            
            logging.info(f"Processing update for student: {student_name}")

            parent_update = ParentUpdate(
                projectId=project_id,
                studentName=student_name,
                fileName=f"{student_name}-ParentUpdate.txt",
                draftText=update_content
            )
            
            update_dict = parent_update.dict()
            logging.info(f"Inserting into 'parent_updates' collection: {update_dict}")
            
            result = db.parent_updates.insert_one(update_dict)
            if result.inserted_id:
                logging.info(f"Successfully inserted parent update with ID: {result.inserted_id}")
                inserted_ids.append(str(result.inserted_id))
            else:
                logging.error(f"Failed to insert parent update for {student_name}. No inserted_id returned.")

        except Exception as e:
            logging.error(f"An exception occurred while inserting parent update for {student_name}: {e}", exc_info=True)

    logging.info(f"Finished processing. Total updates inserted: {len(inserted_ids)}")
    return {"updates": updates, "inserted_ids": inserted_ids}



class GenerationParams(BaseModel):
    subject: str
    level: str
    topic: str


@router.post("/api/v1/projects/{project_id}/generate-lesson-plan")
async def generate_lesson_plan(project_id: str, params: GenerationParams, db=Depends(get_db), user: dict = Depends(get_current_user)):
    user_email = user["email"]
    db_user = db.users.find_one({"email": user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(db_user["_id"])
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = db.projects.find_one({"_id": ObjectId(project_id), "userId": user_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or you do not have access")

    content = generate_mock_content(params.subject, params.level, params.topic)

    lesson_plan = LessonPlan(
        projectId=project_id,
        fileName=f"{params.subject}-{params.level}-{params.topic}-LessonPlan.md",
        content=content["lesson_plan"]
    )
    worksheet = Worksheet(
        projectId=project_id,
        fileName=f"{params.subject}-{params.level}-{params.topic}-Worksheet.md",
        content=content["worksheet"]
    )

    db.lesson_plans.insert_one(lesson_plan.dict())
    db.worksheets.insert_one(worksheet.dict())

    return {
        "lesson_plan": lesson_plan.dict(),
        "worksheet": worksheet.dict()
    }