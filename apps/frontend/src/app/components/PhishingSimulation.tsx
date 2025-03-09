import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSendPhishingEmail } from '../services/phishing.service';
import { toast } from 'react-toastify';

const PhishingSimulationSchema = Yup.object().shape({
  recipientEmail: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  emailTemplate: Yup.string()
    .required('Email content is required')
    .max(500, 'Email content must be less than 500 characters'),
});

const PhishingSimulation: React.FC = () => {
  const navigate = useNavigate();
  const sendEmailMutation = useSendPhishingEmail();

  const formik = useFormik({
    initialValues: {
      recipientEmail: '',
      emailTemplate: '',
    },
    validationSchema: PhishingSimulationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Sending phishing email with data:', values);
        await sendEmailMutation.mutateAsync(values);
        toast.success('Phishing email sent successfully');
        navigate('/phishing-attempts');
      } catch (error) {
        console.error('Error sending phishing email:', error);
      }
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create Phishing Simulation
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">
          Create a phishing simulation by entering the target email and the email content.
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Target Email
            </label>
            <input
              id="recipientEmail"
              type="email"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.recipientEmail && formik.errors.recipientEmail
                  ? 'border-red-500'
                  : ''
              }`}
              placeholder="Enter target email"
              {...formik.getFieldProps('recipientEmail')}
            />
            {formik.touched.recipientEmail && formik.errors.recipientEmail ? (
              <div className="mt-1 text-red-500 text-sm">{formik.errors.recipientEmail}</div>
            ) : null}
          </div>

          <div className="mb-6">
            <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <textarea
              id="emailTemplate"
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formik.touched.emailTemplate && formik.errors.emailTemplate
                  ? 'border-red-500'
                  : ''
              }`}
              placeholder="Enter email content with phishing link"
              {...formik.getFieldProps('emailTemplate')}
            ></textarea>
            {formik.touched.emailTemplate && formik.errors.emailTemplate ? (
              <div className="mt-1 text-red-500 text-sm">{formik.errors.emailTemplate}</div>
            ) : null}
            <p className="mt-2 text-sm text-gray-500">
              Note: The system will automatically insert a phishing link into your content.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/phishing-attempts')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? 'Sending...' : 'Send Phishing Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhishingSimulation;
