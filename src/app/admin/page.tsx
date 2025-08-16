
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useAppContext } from '@/contexts/app-context';
import { AppData, Customer } from '@/lib/types';
import AppHeader from '@/components/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserProfile extends AppData {
  id: string;
}

export default function AdminPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { settings } = useAppContext();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for authentication to finish before checking for admin status
    if (!authLoading) {
      if (!currentUser || !settings.isAdmin) {
        router.replace('/');
        return;
      }
    
      const fetchUsers = async () => {
        try {
          const usersCollection = collection(db, 'users');
          const userSnapshot = await getDocs(usersCollection);
          const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserProfile));
          setUsers(userList);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [currentUser, settings.isAdmin, router, authLoading]);

  const calculateCustomerDues = (user: UserProfile, customerId: string): number => {
    return user.workLogs
      .filter(log => log.customerId === customerId)
      .reduce((totalDue, log) => totalDue + log.balance, 0);
  };

  if (authLoading || loading || !settings.isAdmin) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Loading Admin Panel...</div>;
  }

  return (
    <>
      <AppHeader />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>View all users and their data across the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {users.map(user => (
                <AccordionItem value={user.id} key={user.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                       <Avatar>
                        <AvatarImage src={user.settings.logo} alt={user.settings.userName} />
                        <AvatarFallback>{user.settings.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.settings.userName}</p>
                        <p className="text-sm text-muted-foreground">{user.settings.email || 'No email saved'}</p>
                      </div>
                       {user.settings.isAdmin && <Badge>Admin</Badge>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pl-4">
                      <div>
                        <h4 className="font-semibold mb-2">Details</h4>
                        <div className="flex items-center gap-8">
                          <div>
                            <p className="text-xs text-muted-foreground">Tractor</p>
                            <p>{user.settings.tractorName}</p>
                          </div>
                           <div>
                            <p className="text-xs text-muted-foreground">Signature</p>
                            {user.settings.signature ? (
                              <img src={user.settings.signature} alt="Signature" className="h-10 w-auto bg-slate-100 p-1 rounded" />
                            ) : (
                              <p className="text-sm italic">None</p>
                            )}
                          </div>
                        </div>
                      </div>

                       <div>
                        <h4 className="font-semibold mb-2">Customers ({user.customers.length})</h4>
                        {user.customers.length > 0 ? (
                           <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">Total Due</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {user.customers.map((customer: Customer) => (
                                <TableRow key={customer.id}>
                                  <TableCell>{customer.name}</TableCell>
                                  <TableCell>{customer.phone}</TableCell>
                                  <TableCell>{customer.address || 'N/A'}</TableCell>
                                  <TableCell className="text-right font-semibold text-destructive">
                                    ₹{calculateCustomerDues(user, customer.id).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">This user has no customers yet.</p>
                        )}
                       </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
