import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });
  
  // Update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Mock function to upload profile photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingPhoto(true);
    
    // Simulate upload
    setTimeout(() => {
      setUploadingPhoto(false);
      // Show success message
      alert('Ảnh đại diện đã được cập nhật!');
    }, 1500);
  };
  
  // Mock function to save profile
  const saveProfile = (e) => {
    e.preventDefault();
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      // Show success message
      alert('Hồ sơ đã được cập nhật thành công!');
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-indigo-700 h-48 flex items-end">
          <div className="container mx-auto px-6 flex items-end pb-6">
            <div className="relative">
              <div className="bg-white p-1 rounded-full absolute -bottom-16 shadow-lg">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Photo upload overlay */}
                  {isEditing && (
                    <label 
                      htmlFor="profile-photo" 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white cursor-pointer"
                    >
                      {uploadingPhoto ? (
                        <Spinner size="md" color="light" />
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs mt-1 block">Đổi ảnh</span>
                        </div>
                      )}
                      <input 
                        id="profile-photo" 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            
            <div className="ml-44">
              <h1 className="text-3xl font-bold text-white">{user?.name || 'Người dùng'}</h1>
              <p className="text-indigo-200">{user?.email || 'email@example.com'}</p>
            </div>
            
            <div className="ml-auto">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-indigo-700 rounded-md font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                >
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white text-indigo-700 rounded-md font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile content */}
        <div className="container mx-auto px-6 pt-20 pb-8">
          {isEditing ? (
            <form onSubmit={saveProfile}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Tên hiển thị
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      className="bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Tiểu sử
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Giới thiệu về bạn..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Viết một vài câu về bản thân bạn để mọi người có thể hiểu rõ hơn về bạn.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" color="light" className="mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h2>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Tên hiển thị</p>
                      <p className="mt-1 text-lg text-gray-900">{formData.name}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-lg text-gray-900">{formData.email}</p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                      <p className="mt-1 text-lg text-gray-900">
                        {formData.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <p className="text-sm font-medium text-gray-500">Ngày tham gia</p>
                      <p className="mt-1 text-lg text-gray-900">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) 
                          : <span className="text-gray-400 italic">Không có thông tin</span>
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900">Tiểu sử</h2>
                <div className="mt-4 border-b border-gray-200 pb-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {formData.bio || <span className="text-gray-400 italic">Chưa có thông tin tiểu sử</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 