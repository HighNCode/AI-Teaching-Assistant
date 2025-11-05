import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { User } from '@/types';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmNewPassword: z.string().min(6, { message: 'Confirm new password' }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const handleChangePassword = async (data: PasswordFormInputs) => {
    if (!user) {
      showError('You must be logged in to change your password.');
      return;
    }

    const toastId = showLoading('Changing password...');

    // Simulate password change in localStorage
    const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);

    if (userIndex > -1) {
      const currentUserData = storedUsers[userIndex] as any; // Cast to any to access password
      if (currentUserData.password === data.currentPassword) {
        currentUserData.password = data.newPassword; // Update password
        storedUsers[userIndex] = currentUserData;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        dismissToast(toastId);
        showSuccess('Password changed successfully!');
        reset(); // Clear form fields
      } else {
        dismissToast(toastId);
        showError('Current password is incorrect.');
      }
    } else {
      dismissToast(toastId);
      showError('User not found.');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold">User Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
              />
              {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...register('confirmNewPassword')}
              />
              {errors.confirmNewPassword && <p className="text-red-500 text-sm">{errors.confirmNewPassword.message}</p>}
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;