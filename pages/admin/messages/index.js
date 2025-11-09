import AdminLayout from '@/components/admin/AdminLayout'
export default function Page(){
  return (<AdminLayout title="Message">
    <h1 className="text-2xl font-semibold mb-4">Message</h1>
    <div className="bg-white border rounded-2xl p-4">Coming soon — Message management CRUD will be wired to API.</div>
  </AdminLayout>)
}
