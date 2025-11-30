"use client"

import { DataTable } from "@/app/unit/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { AddUnitDialog } from "../app/unit/add-unit-dialog"
import { createJurusanColumns, createProdiColumns, Fakultas, fakultasColumns, Jurusan, ProgramStudi } from "../app/unit/columns"

interface UnitManagementClientProps {
  fakultasData: Fakultas[]
  jurusanData: Jurusan[]
  prodiData: ProgramStudi[]
}

export function UnitManagementClient({ 
  fakultasData, 
  jurusanData,
  prodiData 
}: UnitManagementClientProps) {
  const [activeTab, setActiveTab] = useState("fakultas")
  
  // Create jurusan and prodi columns with fakultasData
  const jurusanColumns = createJurusanColumns(fakultasData)
  const prodiColumns = createProdiColumns(fakultasData)

  return (
    <>
      <div className="text-3xl font-bold tracking-tight">Academic Units</div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="fakultas">Fakultas</TabsTrigger>
            <TabsTrigger value="jurusan">Jurusan</TabsTrigger>
            <TabsTrigger value="prodi">Program Studi</TabsTrigger>
          </TabsList>
          
          <AddUnitDialog 
            activeTab={activeTab}
            fakultasData={fakultasData}
          />
        </div>
        
        <TabsContent value="fakultas">
          <DataTable columns={fakultasColumns} data={fakultasData} />
        </TabsContent>
        
        <TabsContent value="jurusan">
          <DataTable columns={jurusanColumns} data={jurusanData} />
        </TabsContent>
        
        <TabsContent value="prodi">
          <DataTable columns={prodiColumns} data={prodiData} />
        </TabsContent>
      </Tabs>
    </>
  )
}