import AdminLayout from '@/components/admin/AdminLayout'
export default function Page(){
  return (<AdminLayout title="My Account">
    <h1 className="text-2xl font-semibold mb-4">My Account</h1>
    <div className="bg-white border rounded-2xl p-4">Profile form and password update here.</div>
  </AdminLayout>)
}
