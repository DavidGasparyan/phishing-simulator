import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreatePhishingAttempt, useSendPhishingEmail } from '../services/phishing.service';
import { PhishingAttempt } from '../models/phishing-attempt.model';

const PhishingSimulationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: Yup.string().required('Subject is required'),
  content: Yup.string().required('Email content is required'),
});

const PhishingSimulation: React.FC = () => {
  const navigate = useNavigate();
  const createAttemptMutation = useCreatePhishingAttempt();
  const sendEmailMutation = useSendPhishingEmail();
  const [createdAttempt, setCreatedAttempt] = useState<PhishingAttempt | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      subject: '',
      content: '',
    },
    validationSchema: PhishingSimulationSchema,
    onSubmit: async (values) => {
      try {
        const attempt = await createAttemptMutation.mutateAsync(values);
        setCreatedAttempt(attempt);
      } catch (error) {
        console.error('Error creating phishing attempt:', error);
      }
    },
  });

  const handleSendEmail = async () => {
    if (!createdAttempt) return;

    try {
      await sendEmailMutation.mutateAsync(createdAttempt.id);
      navigate('/phishing-attempts');
    } catch (error) {
      console.error('Error sending phishing email:', error);
    }
  };

  const handleCancel = () => {
    setCreatedAttempt(null);
    formik.resetForm();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create Phishing Simulation
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {!createdAttempt ? (
          <>
            <p className="text-gray-600 mb-4">
              Create a phishing simulation by entering the target email and the email content.
            </p>

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Target Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter target email"
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="mt-1 text-red-500 text-sm">{formik.errors.email}</div>
                ) : null}
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="form-label">
                  Email Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className={`form-input ${
                    formik.touched.subject && formik.errors.subject
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter email subject"
                  {...formik.getFieldProps('subject')}
                />
                {formik.touched.subject && formik.errors.subject ? (
                  <div className="mt-1 text-red-500 text-sm">{formik.errors.subject}</div>
                ) : null}
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="form-label">
                  Email Content
                </label>
                <textarea
                  id="content"
                  rows={6}
                  className={`form-input ${
                    formik.touched.content && formik.errors.content
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter email content with phishing link"
                  {...formik.getFieldProps('content')}
                ></textarea>
                {formik.touched.content && formik.errors.content ? (
                  <div className="mt-1 text-red-500 text-sm">{formik.errors.content}</div>
                ) : null}
                <p className="mt-2 text-sm text-gray-500">
                  Note: The system will automatically insert a phishing link into your content.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createAttemptMutation.isPending}
                >
                  {createAttemptMutation.isPending ? 'Creating...' : 'Create Simulation'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-300 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Simulation Created</h3>
              <p className="text-blue-700 mb-1">
                <strong>Target Email:</strong> {createdAttempt.email}
              </p>
              <p className="text-blue-700 mb-1">
                <strong>Subject:</strong> {createdAttempt.subject}
              </p>
              <p className="text-blue-700">
                <strong>Status:</strong>{' '}
                <span className="inline-block status-new">NEW</span>
              </p>
            </div>

            <div className="border rounded-md p-4 mb-6">
              <h4 className="font-medium mb-2">Email Preview</h4>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="mb-1"><strong>To:</strong> {createdAttempt.email}</p>
                <p className="mb-1"><strong>Subject:</strong> {createdAttempt.subject}</p>
                <hr className="my-2" />
                <div className="whitespace-pre-wrap">{createdAttempt.content}</div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={sendEmailMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="btn btn-primary"
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? 'Sending...' : 'Send Phishing Email'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhishingSimulation;
