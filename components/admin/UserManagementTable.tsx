import { useState, useEffect } from "react";
import { authClient } from "../../src/lib/auth-client";
import { UserResponseDto, RoleResponseDto, AdminUpdateUserDto } from "../../src/lib/auth-types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Shield, CheckCircle2, XCircle, Loader2, Search, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Pagination } from "@/components/common/pagination";

interface UserManagementTableProps {
  onUsersChanged?: () => void;
}

export function UserManagementTable({ onUsersChanged }: UserManagementTableProps) {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [roles, setRoles] = useState<RoleResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const pageSize = 20;

  const [editFormData, setEditFormData] = useState<AdminUpdateUserDto & { id: string }>({
    id: "",
    first_name: "",
    last_name: "",
    display_name: "",
    user_status: "active",
    role_id: ""
  });

  const fetchUsers = async (notifyChange = true, page = currentPage) => {
    try {
      setIsLoading(true);
      const response = await authClient.listUsers({ page, limit: pageSize });
      setUsers(response.items);
      setCurrentPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
      setTotalUsers(response.meta.total);
      if (notifyChange) {
        onUsersChanged?.();
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await authClient.findAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  useEffect(() => {
    fetchUsers(false, currentPage);
    fetchRoles();
  }, []);

  useEffect(() => {
    if (currentPage === 1) return;
    fetchUsers(false, currentPage);
  }, [currentPage]);

  const handleEditClick = (user: UserResponseDto) => {
    setEditingUser(user);
    setEditFormData({
      id: user.user_id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      display_name: user.display_name || "",
      user_status: user.user_status,
      role_id: user.role?.role_id || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { id, ...updateData } = editFormData;
      await authClient.adminUpdateUser(id, updateData);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await authClient.removeUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">Active</span>;
      case "inactive":
        return <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase border border-zinc-200">Inactive</span>;
      case "suspended":
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200">Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-background p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-10 bg-muted/30 focus:bg-background transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchUsers(true, currentPage)} disabled={isLoading}>
            Refresh
          </Button>
          <Button size="sm">
            Add New User
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-75">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <p className="text-muted-foreground text-sm">No users found.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(user.first_name?.[0] || user.display_name?.[0] || user.email[0]).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {user.display_name || `${user.first_name} ${user.last_name}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.user_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-50 border border-zinc-200 w-fit">
                      <Shield className="h-3 w-3 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-600 capitalize">{user.role?.name || "No Role"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.email_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase border border-amber-200">
                        <XCircle className="h-3 w-3" />Unverified
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {user.last_login_at ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(user.last_login_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-border/50 backdrop-blur-xl bg-white/95 dark:bg-zinc-950/95 overflow-hidden p-1">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(user)} className="rounded-lg my-0.5 cursor-pointer font-medium focus:bg-primary/10 focus:text-primary">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="rounded-lg my-0.5 cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Showing page {currentPage} of {totalPages} · Total users: {totalUsers}
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Modify user information, status, and system roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name text-xs" className="text-xs">First Name</Label>
                <Input 
                  id="edit_first_name" 
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData(p => ({ ...p, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name" className="text-xs">Last Name</Label>
                <Input 
                  id="edit_last_name" 
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData(p => ({ ...p, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_display_name" className="text-xs">Display Name</Label>
              <Input 
                id="edit_display_name" 
                value={editFormData.display_name}
                onChange={(e) => setEditFormData(p => ({ ...p, display_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Account Status</Label>
                <Select 
                  value={editFormData.user_status} 
                  onValueChange={(v: any) => setEditFormData(p => ({ ...p, user_status: v }))}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="active" className="rounded-lg">Active</SelectItem>
                    <SelectItem value="inactive" className="rounded-lg">Inactive</SelectItem>
                    <SelectItem value="suspended" className="rounded-lg">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">System Role</Label>
                <Select 
                  value={editFormData.role_id} 
                  onValueChange={(v) => setEditFormData(p => ({ ...p, role_id: v }))}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    {roles.map(role => (
                      <SelectItem key={role.role_id} value={role.role_id} className="rounded-lg capitalize">
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
