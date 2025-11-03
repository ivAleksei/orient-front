import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/_shared/pipes/pipes.module';


const routes: Routes = [
  {
    path: 'roles',
    loadChildren: () => import('src/apps/baseorient/content/admin/roles/roles.module').then(m => m.RolesPageModule)
  },
  {
    path: 'permissions',
    loadChildren: () => import('src/apps/baseorient/content/admin/permissions/permissions.module').then(m => m.PermissionsPageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('src/apps/baseorient/content/admin/users/users.module').then(m => m.UsersPageModule)
  },
  {
    path: 'persons',
    loadChildren: () => import('src/apps/baseorient/content/admin/persons/persons.module').then(m => m.PersonsPageModule)
  },
  { path: '**', redirectTo: "/internal/home" },
];

@NgModule({
  imports: [
    IonicModule,
    FormsModule,
    PipesModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})
export class AdminModule { }
