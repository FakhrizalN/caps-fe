import { columns, type Employee } from "./columns"
import { DataTable } from "./data-table"

// Sample data
async function getData(): Promise<Employee[]> {
  return [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@itk.ac.id",
      role: "Admin",
      unit: "Computer Science",
      unitId: "CS001",
      phone: "+62 812-3456-7890",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@itk.ac.id",
      role: "Staff",
      unit: "Information Technology",
      unitId: "IT001",
      phone: "+62 813-4567-8901",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@itk.ac.id",
      role: "Manager",
      unit: "Electrical Engineering",
      unitId: "EE001",
      phone: "+62 814-5678-9012",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice.brown@itk.ac.id",
      role: "Staff",
      unit: "Mechanical Engineering",
      unitId: "ME001",
      phone: "+62 815-6789-0123",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie.wilson@itk.ac.id",
      role: "Admin",
      unit: "Civil Engineering",
      unitId: "CE001",
      phone: "+62 816-7890-1234",
    },
  ]
}

export default async function EmployeePage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-muted-foreground">
            Manage and view employee information.
          </p>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}