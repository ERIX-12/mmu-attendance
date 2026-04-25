from django.db import migrations

def populate_mmu_data(apps, schema_editor):
    Faculty = apps.get_model('courses', 'Faculty')
    Department = apps.get_model('courses', 'Department')

    FACULTY_DEPARTMENTS = {
        'FACULTY OF SCIENCE, TECHNOLOGY AND INNOVATION': [
            'Computer Science', 'Information Technology', 'Software Engineering', 'Data Science', 'Cybersecurity'
        ],
        'FACULTY OF EDUCATION': [
            'Educational Foundations', 'Curriculum and Instruction', 'Early Childhood Education', 'Special Needs Education'
        ],
        'FACULTY OF BUSINESS AND HUMANITIES': [
            'Business Administration', 'Accounting and Finance', 'Humanities', 'Economics'
        ],
        'FACULTY OF AGRICULTURE AND AGRO-ECOLOGY': [
            'Agriculture', 'Agro-Ecology', 'Agribusiness'
        ],
        'FACULTY OF HEALTH SCIENCES': [
            'Nursing', 'Public Health', 'Midwifery', 'Clinical Medicine'
        ],
        'FACULTY OF ENGINEERING AND TECHNOLOGY': [
            'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'
        ]
    }

    for faculty_name, departments in FACULTY_DEPARTMENTS.items():
        faculty, created = Faculty.objects.get_or_create(name=faculty_name)
        for dept_name in departments:
            Department.objects.get_or_create(name=dept_name, faculty=faculty)

class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_faculty_department'),
    ]

    operations = [
        migrations.RunPython(populate_mmu_data),
    ]
