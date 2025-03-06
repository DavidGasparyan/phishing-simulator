import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLogin } from '../services/auth.service';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        await loginMutation.mutateAsync(values);
        navigate('/phishing-attempts');
      } catch (error) {
        // Error handling is done in the mutation
        console.error('Login error:', error);
      }
    },
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Login to Your Account
          </h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : ''
                }`}
                placeholder="Enter your email"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="mt-1 text-red-500 text-sm">{formik.errors.email}</div>
              ) : null}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`form-input ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : ''
                }`}
                placeholder="Enter your password"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="mt-1 text-red-500 text-sm">{formik.errors.password}</div>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-2 px-4"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-800">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
