import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#E6C068', 
        backgroundColor: '#FFE5B4' 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D4611A',
      }}
      text2Style={{
        fontSize: 14,
        color: '#F4A261',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#FF6F61', 
        backgroundColor: '#FDECEA' 
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828',
      }}
      text2Style={{
        fontSize: 14,
        color: '#D32F2F',
      }}
    />
  ),
};

export default toastConfig;
