'use client';

import Button from "@/components/Button";
import Checkbox from "@/components/form/Checkbox";
import FormField from "@/components/form/FormField";
import Input from "@/components/form/Input";
import React, { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    
    // Check if email contains @
    if (!email.includes('@')) {
      return "Sertakan '@' pada alamat email. '" + email + "' tidak memiliki '@'.";
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for better UX
    if (touched[name as keyof typeof touched]) {
      let error = '';
      if (name === 'email') {
        error = validateEmail(value);
      } else if (name === 'password') {
        error = validatePassword(value);
      }
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    let error = '';
    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    const newErrors = {
      email: emailError,
      password: passwordError
    };

    setErrors(newErrors);

    // If no errors, proceed with login
    if (!emailError && !passwordError) {
      console.log('Login attempt:', formData);
      // Here you would typically call your login API
    }
  };

  const getFieldState = (fieldName: keyof typeof errors) => {
    return errors[fieldName] ? 'error' : 'default';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-[514px] p-12 bg-white rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] inline-flex flex-col justify-start items-center gap-7 overflow-hidden">
        {/* Header */}
        <div className="self-stretch flex flex-col justify-start items-center gap-5">
          <div className="self-stretch text-center justify-start text-gray-900 text-2xl font-bold font-inter leading-loose">
            Sign in
          </div>
        </div>

        {/* Form */}
        <form 
          className="self-stretch flex flex-col justify-start items-center gap-6" 
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email Field */}
          <FormField
            label="Email address"
            required
            errorMessage={touched.email ? errors.email : ''}
            className="self-stretch"
          >
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="filament@mail.com"
              state={getFieldState('email')}
            />
          </FormField>

          {/* Password Field */}
          <FormField
            label="Password"
            required
            errorMessage={touched.password ? errors.password : ''}
            className="self-stretch"
          >
            <Input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="••••••••••"
              state={getFieldState('password')}
              showPasswordToggle
            />
          </FormField>

          {/* Remember Me Checkbox */}
          <div className="self-stretch inline-flex justify-start items-start gap-3">
            <div className="size- pt-0.5 flex justify-start items-start gap-2.5">
              <Checkbox
                id="remember-me"
                name="rememberMe"
                label=""
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="m-0 p-0"
              />
            </div>
            <div className="w-[87px] inline-flex flex-col justify-start items-start">
              <label 
                htmlFor="remember-me"
                className="justify-start text-gray-950 text-sm font-medium font-inter leading-tight cursor-pointer"
              >
                Remember me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="self-stretch px-4 py-2 bg-primary-700 rounded-lg shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)] inline-flex justify-center items-center gap-1.5"
          >
            <div className="text-center justify-start text-white text-sm font-semibold font-inter leading-tight">
              Sign in
            </div>
          </Button>
        </form>
      </div>
    </div>
  );
}