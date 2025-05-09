import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [notificationSettings, setNotificationSettings] = useState({
    newMessage: true,
    messageRead: true,
    newFriend: true,
    sound: true,
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    showEmojis: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showReadReceipts: true,
    allowSearchByEmail: true,
  });
  
  // Mock function to save settings
  const saveSettings = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      // Show success message
      alert('Cài đặt đã được lưu thành công!');
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('general')}
          >
            Chung
          </button>
          <button
            className={`${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('notifications')}
          >
            Thông báo
          </button>
          <button
            className={`${
              activeTab === 'appearance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('appearance')}
          >
            Giao diện
          </button>
          <button
            className={`${
              activeTab === 'privacy'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('privacy')}
          >
            Quyền riêng tư
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* General settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Thông tin tài khoản</h2>
            
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
                    defaultValue={user?.name || ''}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    defaultValue={user?.email || ''}
                    disabled
                    className="bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi.</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900">Mật khẩu</h2>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
              </p>
              
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Thay đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Notification settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Cài đặt thông báo</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tùy chỉnh cách bạn nhận thông báo từ ứng dụng.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="newMessage"
                    name="newMessage"
                    type="checkbox"
                    checked={notificationSettings.newMessage}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newMessage: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="newMessage" className="font-medium text-gray-700">
                    Tin nhắn mới
                  </label>
                  <p className="text-gray-500">Nhận thông báo khi có tin nhắn mới.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="messageRead"
                    name="messageRead"
                    type="checkbox"
                    checked={notificationSettings.messageRead}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      messageRead: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="messageRead" className="font-medium text-gray-700">
                    Đã đọc tin nhắn
                  </label>
                  <p className="text-gray-500">Nhận thông báo khi tin nhắn của bạn đã được đọc.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="newFriend"
                    name="newFriend"
                    type="checkbox"
                    checked={notificationSettings.newFriend}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newFriend: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="newFriend" className="font-medium text-gray-700">
                    Bạn bè mới
                  </label>
                  <p className="text-gray-500">Nhận thông báo khi có yêu cầu kết bạn mới.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="sound"
                    name="sound"
                    type="checkbox"
                    checked={notificationSettings.sound}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      sound: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="sound" className="font-medium text-gray-700">
                    Âm thanh
                  </label>
                  <p className="text-gray-500">Phát âm thanh khi nhận thông báo.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Appearance settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Tùy chỉnh giao diện</h2>
            <p className="mt-1 text-sm text-gray-500">
              Thay đổi chủ đề và kích thước hiển thị.
            </p>
            
            <div className="mt-4">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Chủ đề
              </label>
              <select
                id="theme"
                name="theme"
                value={appearanceSettings.theme}
                onChange={(e) => setAppearanceSettings({
                  ...appearanceSettings,
                  theme: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
                <option value="system">Theo hệ thống</option>
              </select>
            </div>
            
            <div className="mt-4">
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
                Kích thước chữ
              </label>
              <select
                id="fontSize"
                name="fontSize"
                value={appearanceSettings.fontSize}
                onChange={(e) => setAppearanceSettings({
                  ...appearanceSettings,
                  fontSize: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="small">Nhỏ</option>
                <option value="medium">Vừa</option>
                <option value="large">Lớn</option>
              </select>
            </div>
            
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showEmojis"
                    name="showEmojis"
                    type="checkbox"
                    checked={appearanceSettings.showEmojis}
                    onChange={(e) => setAppearanceSettings({
                      ...appearanceSettings,
                      showEmojis: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="showEmojis" className="font-medium text-gray-700">
                    Hiển thị biểu tượng cảm xúc
                  </label>
                  <p className="text-gray-500">Hiển thị biểu tượng cảm xúc trong tin nhắn.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Cài đặt quyền riêng tư</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kiểm soát thông tin cá nhân và quyền riêng tư của bạn.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showOnlineStatus"
                    name="showOnlineStatus"
                    type="checkbox"
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      showOnlineStatus: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="showOnlineStatus" className="font-medium text-gray-700">
                    Hiển thị trạng thái trực tuyến
                  </label>
                  <p className="text-gray-500">Cho phép người khác biết khi bạn đang hoạt động.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showReadReceipts"
                    name="showReadReceipts"
                    type="checkbox"
                    checked={privacySettings.showReadReceipts}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      showReadReceipts: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="showReadReceipts" className="font-medium text-gray-700">
                    Xác nhận đã đọc
                  </label>
                  <p className="text-gray-500">Hiển thị khi bạn đã đọc tin nhắn.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allowSearchByEmail"
                    name="allowSearchByEmail"
                    type="checkbox"
                    checked={privacySettings.allowSearchByEmail}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      allowSearchByEmail: e.target.checked
                    })}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allowSearchByEmail" className="font-medium text-gray-700">
                    Cho phép tìm kiếm bằng email
                  </label>
                  <p className="text-gray-500">Cho phép người dùng khác tìm thấy bạn bằng địa chỉ email.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Save button */}
        <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
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
      </div>
    </div>
  );
};

export default Settings; 