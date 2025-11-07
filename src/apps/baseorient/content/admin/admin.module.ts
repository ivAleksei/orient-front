import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/_shared/pipes/pipes.module';


const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('src/apps/baseorient/content/admin/dashboard-admin/dashboard-admin.module').then(m => m.DashboardAdminPageModule)
  },
  {
    path: 'confederations',
    loadChildren: () => import('src/apps/baseorient/content/admin/confederations/confederations.module').then(m => m.ConfederationsPageModule)
  },
  {
    path: 'federations',
    loadChildren: () => import('src/apps/baseorient/content/admin/federations/federations.module').then(m => m.FederationsPageModule)
  },
  {
    path: 'clubs',
    loadChildren: () => import('src/apps/baseorient/content/admin/clubs/clubs.module').then(m => m.ClubsPageModule)
  },
  {
    path: 'permissions',
    loadChildren: () => import('src/apps/baseorient/content/admin/permissions/permissions.module').then(m => m.PermissionsPageModule)
  },
  {
    path: 'roles',
    loadChildren: () => import('src/apps/baseorient/content/admin/roles/roles.module').then(m => m.RolesPageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('src/apps/baseorient/content/admin/users/users.module').then(m => m.UsersPageModule)
  },
  {
    path: 'persons',
    loadChildren: () => import('src/apps/baseorient/content/admin/persons/persons.module').then(m => m.PersonsPageModule)
  },
  {
    path: 'configs',
    loadChildren: () => import('src/apps/baseorient/content/admin/configs/configs.module').then(m => m.ConfigsPageModule)
  },
  {
    path: 'seasons',
    loadChildren: () => import('src/apps/baseorient/content/admin/seasons/seasons.module').then(m => m.SeasonsPageModule)
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
