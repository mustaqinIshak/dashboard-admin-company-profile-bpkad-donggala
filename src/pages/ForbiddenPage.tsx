import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-blue-600">403</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
          Akses Ditolak
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah sebuah kesalahan.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;