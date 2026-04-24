import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { 
  Users, Shield, UserPlus, Trash2, Loader2, Search, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    const data = await db.entities.User.list('-created_date');
    setUsers(data);
    const me = await db.auth.me();
    setCurrentUser(me);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('يجب إدخال البريد الإلكتروني');
      return;
    }

    setInviting(true);
    await db.entities.User.create({
      email: inviteEmail,
      role: inviteRole,
      created_at: new Date().toISOString(),
    });
    toast.success('تم إنشاء دعوة المستخدم بنجاح');
    setInviting(false);
    setDialogOpen(false);
    setInviteEmail('');
    loadUsers();
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.id === currentUser?.id) {
      toast.error('لا يمكنك تغيير صلاحيتك');
      return;
    }
    await db.entities.User.update(user.id, { role: newRole });
    toast.success('تم تحديث الصلاحية');
    loadUsers();
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{adminCount}</p>
              <p className="text-sm text-stone-500">{t('admins')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{userCount}</p>
              <p className="text-sm text-stone-500">{t('users')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700 overflow-hidden">
        <div className="p-6 border-b border-amber-100 dark:border-stone-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="pl-9 rtl:pr-9 rtl:pl-4"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
              <UserPlus className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
              دعوة مستخدم
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 dark:bg-stone-900">
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-amber-50 dark:hover:bg-stone-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800 dark:text-stone-200">
                            {user.full_name || 'بدون اسم'}
                          </p>
                          {user.id === currentUser?.id && (
                            <Badge variant="outline" className="text-xs">أنت</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-stone-600 dark:text-stone-400">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                        {user.role === 'admin' ? t('admins') : t('users')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-stone-500 text-sm">
                      {new Date(user.created_at || user.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.id !== currentUser?.id && (
                        <Select 
                          value={user.role} 
                          onValueChange={(v) => handleChangeRole(user, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{t('users')}</SelectItem>
                            <SelectItem value="admin">{t('admins')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>دعوة مستخدم جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('role')}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('users')}</SelectItem>
                  <SelectItem value="admin">{t('admins')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleInvite} disabled={inviting} className="bg-amber-500 hover:bg-amber-600">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Mail className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  إرسال الدعوة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}