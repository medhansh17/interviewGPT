from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os

app = Flask(__name__)

current_directory=os.getcwd()
# Create the folder if it doesn't exist
resume_folder=os.path.join(current_directory,"resume_folder_final")
if not os.path.exists(resume_folder):
    os.makedirs(resume_folder)

# Specify the folder location where you want to store the database file
db_folder=os.path.join(current_directory,"Database")
if not os.path.exists(db_folder):
    os.makedirs(db_folder)


# Create the folder if it doesn't exist
if not os.path.exists(db_folder):
    os.makedirs(db_folder)

# Specify the SQLite database URI with the folder location
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(db_folder, "jobs.db")}'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
db = SQLAlchemy(app)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    jd = db.Column(db.Text, nullable=False)
    resumes = db.relationship('Resume', backref='job', lazy=True)
     # Timestamp when the job is uploaded
    #timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Job {self.role}>'
    
# Resume model
class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)

    def __repr__(self):
        return f'<Resume {self.filename}>'


# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/upload_job', methods=['POST'])
def upload_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job already exists
        with app.app_context():
            existing_job = Job.query.filter_by(role=role, jd=jd).first()
        if existing_job:
            return jsonify({'message': 'Job JD already exists.'}), 400

        # Save the job to the database
        new_job = Job(role=role, jd=jd)
        with app.app_context():
            db.session.add(new_job)
            db.session.commit()
        #return jsonify({'message': 'Job uploaded successfully.','timestamp': new_job.timestamp}), 200
        return jsonify({'message': 'Job uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

#To display the role and jd details in tabular foramt.
@app.route('/export_jobs_json', methods=['GET'])
def export_jobs_json():
    jobs = Job.query.all()
    jobs_list = [{'id': job.id, 'role': job.role, 'jd': job.jd} for job in jobs]
    return jsonify(jobs_list)

#To delete the specific role and jd
@app.route('/delete_job', methods=['POST'])
def delete_job():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job exists
        job = Job.query.filter_by(role=role, jd=jd).first()
        if job:
            db.session.delete(job)
            db.session.commit()
            return jsonify({'message': f'Job with role "{role}" deleted successfully.'})
           # return jsonify({'message': f'Job with role "{role}" and JD "{jd}" deleted successfully.'}), 200
        else:
            return jsonify({'message': 'Job not found.'}), 404
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400
    


# route for uploading resumes for specific job roles and job descriptions
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    data = request.get_json()
    role = data.get('role')
    jd = data.get('jd')

    if role and jd:
        # Check if the job exists in the database
        with app.app_context():
            job = Job.query.filter_by(role=role, jd=jd).first()
        if not job:
            return jsonify({'message': 'Specified job role or description does not exist.'}), 400

        # Save the resume file(s) to the resume folder
        for resume_file in request.files.getlist('resume'):
            resume_filename = resume_file.filename
            resume_path = os.path.join(resume_folder, resume_filename)
            resume_file.save(resume_path)

            # Associate the resume file with the job in the database
            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

        return jsonify({'message': 'Resume(s) uploaded successfully.'}), 200
    else:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

if __name__ == '__main__':
    app.run(debug=True)
