import AdminLayout from '@/components/admin/AdminLayout'
export default function Page(){
  return (<AdminLayout title="Settings">
    <h1 className="text-2xl font-semibold mb-4">Settings</h1>
    <div className="bg-white border rounded-2xl p-4">System and preferences settings go here.</div>
  </AdminLayout>)
}
