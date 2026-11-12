import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Blog from './pages/public/Blog';
import BlogDetail from './pages/public/BlogDetail';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Posts from './pages/admin/Posts';
import PostForm from './pages/admin/PostForm';
import Categories from './pages/admin/Categories';
import Users from './pages/admin/Users';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin protected */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<Posts />} />
          <Route path="posts/new" element={<PostForm />} />
          <Route path="posts/:id/edit" element={<PostForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
