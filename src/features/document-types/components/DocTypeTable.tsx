import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DocumentType } from "../types";

interface DocTypeTableProps {
  editedTypes: DocumentType[];
  positions: string[];
  onFieldChange: (id: string, field: keyof DocumentType, value: string | boolean | number | null) => void;
  onFormatToggle: (typeId: string, format: string, currentFormatsStr: string) => void;
  onDelete: (id: string, name: string) => void;
}

const AVAILABLE_FORMATS = ["PDF", "JPG", "PNG", "DOCX", "XLSX", "ZIP"];

export function DocTypeTable({
  editedTypes,
  positions,
  onFieldChange,
  onFormatToggle,
  onDelete,
}: DocTypeTableProps) {
  return (
    <Table className="table-fixed w-full min-w-[1080px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-bold text-xs w-[160px]">Nama Dokumen</TableHead>
          <TableHead className="font-bold text-xs w-[240px]">Deskripsi</TableHead>
          <TableHead className="font-bold text-xs w-[110px]">Batas Ukuran</TableHead>
          <TableHead className="font-bold text-xs w-[170px]">Format Diizinkan</TableHead>
          <TableHead className="font-bold text-xs w-[160px]">Target Posisi</TableHead>
          <TableHead className="font-bold text-xs text-center w-[80px]">Mandatori</TableHead>
          <TableHead className="font-bold text-xs text-center w-[100px]">Masa Berlaku</TableHead>
          <TableHead className="font-bold text-xs text-right w-[60px]">Hapus</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {editedTypes.map((type) => (
          <TableRow key={type.id} className="hover:bg-muted/50">
            <TableCell className="align-middle">
              <Input
                value={type.name}
                onChange={(e) => onFieldChange(type.id, "name", e.target.value)}
                className="font-extrabold text-xs h-8 text-foreground bg-transparent"
              />
            </TableCell>
            <TableCell className="align-middle">
              <Input
                value={type.description || ""}
                onChange={(e) => onFieldChange(type.id, "description", e.target.value)}
                placeholder="Deskripsi singkat..."
                className="text-xs h-8 text-muted-foreground bg-transparent font-medium"
              />
            </TableCell>
            <TableCell className="align-middle">
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={type.maxSize}
                  onChange={(e) => onFieldChange(type.id, "maxSize", parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-xs font-bold text-foreground bg-transparent text-center"
                />
                <span className="text-[10px] font-bold text-muted-foreground">MB</span>
              </div>
            </TableCell>
            <TableCell className="align-middle">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left font-semibold text-xs justify-between h-9 py-1"
                    >
                      <div className="flex flex-row items-center gap-1 overflow-hidden">
                        {(() => {
                          const activeFormats = type.allowedFormats
                            .split(",")
                            .map((f) => f.trim().toUpperCase())
                            .filter(Boolean);
                          const displayFormats = activeFormats.slice(0, 3);
                          const extraCount = activeFormats.length - 3;
                          return (
                            <>
                              {displayFormats.map((fmt) => (
                                <Badge
                                  key={fmt}
                                  className="bg-[#6c63ff]/10 hover:bg-[#6c63ff]/10 text-[#6c63ff] text-[9px] font-bold px-1.5 py-0.5 border-0 rounded-md whitespace-nowrap"
                                >
                                  {fmt}
                                </Badge>
                              ))}
                              {extraCount > 0 && (
                                <span className="text-[10px] font-extrabold text-muted-foreground whitespace-nowrap ml-0.5">
                                  +{extraCount}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-muted-foreground" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[150px]">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const activeFormats = type.allowedFormats
                      .split(",")
                      .map((f) => f.trim().toUpperCase());
                    const isActive = activeFormats.includes(fmt);
                    return (
                      <DropdownMenuCheckboxItem
                        key={fmt}
                        checked={isActive}
                        onCheckedChange={() => onFormatToggle(type.id, fmt, type.allowedFormats)}
                        className="text-xs font-semibold"
                      >
                        {fmt}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell className="align-middle">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left font-semibold text-xs justify-between h-9"
                    >
                      <span className="truncate max-w-[130px]">
                        {(() => {
                          if (!type.targetPositions) return "Semua Posisi";
                          const activeList = type.targetPositions.split(",").map((p) => p.trim());
                          if (activeList.length <= 2) return type.targetPositions;
                          return `${activeList.slice(0, 2).join(", ")} +${activeList.length - 2}`;
                        })()}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-muted-foreground" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[150px]">
                  <DropdownMenuCheckboxItem
                    checked={!type.targetPositions}
                    onCheckedChange={() => onFieldChange(type.id, "targetPositions", null)}
                    className="text-xs font-semibold"
                  >
                    Semua Posisi (Universal)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {positions.map((posName) => {
                    const currentList = type.targetPositions
                      ? type.targetPositions.split(",").map((p) => p.trim())
                      : [];
                    const isChecked = currentList.includes(posName);
                    return (
                      <DropdownMenuCheckboxItem
                        key={posName}
                        checked={isChecked}
                        onCheckedChange={() => {
                          let newList;
                          if (isChecked) {
                            newList = currentList.filter((p) => p !== posName);
                          } else {
                            newList = [...currentList, posName];
                          }
                          const val = newList.length > 0 ? newList.join(", ") : null;
                          onFieldChange(type.id, "targetPositions", val);
                        }}
                        className="text-xs font-semibold"
                      >
                        {posName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell className="align-middle text-center">
              <div className="flex justify-center">
                <Switch
                  checked={type.isMandatory}
                  onCheckedChange={(val) => onFieldChange(type.id, "isMandatory", val)}
                />
              </div>
            </TableCell>
            <TableCell className="align-middle text-center">
              <div className="flex justify-center">
                <Switch
                  checked={type.requiresExpiryDate}
                  onCheckedChange={(val) => onFieldChange(type.id, "requiresExpiryDate", val)}
                />
              </div>
            </TableCell>
            <TableCell className="align-middle text-right pr-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                onClick={() => onDelete(type.id, type.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
