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
    path: 'contacts',
    loadChildren: () => import('src/apps/baseorient/content/admin/contacts/contacts.module').then(m => m.ContactsPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('src/apps/baseorient/content/admin/events/events.module').then(m => m.EventsPageModule)
  },
  {
    path: 'event/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/event-details/event-details.module').then(m => m.EventDetailsPageModule)
  },
  {
    path: 'partners',
    loadChildren: () => import('src/apps/baseorient/content/admin/partners/partners.module').then(m => m.PartnersPageModule)
  },
  {
    path: 'confederations',
    loadChildren: () => import('src/apps/baseorient/content/admin/confederations/confederations.module').then(m => m.ConfederationsPageModule)
  },
  {
    path: 'confederation/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/confederation-details/confederation-details.module').then(m => m.ConfederationDetailsPageModule)
  },
  {
    path: 'federations',
    loadChildren: () => import('src/apps/baseorient/content/admin/federations/federations.module').then(m => m.FederationsPageModule)
  },
  {
    path: 'federation/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/federation-details/federation-details.module').then(m => m.FederationDetailsPageModule)
  },
  {
    path: 'clubs',
    loadChildren: () => import('src/apps/baseorient/content/admin/clubs/clubs.module').then(m => m.ClubsPageModule)
  },
  {
    path: 'club/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/club-details/club-details.module').then(m => m.ClubDetailsPageModule)
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
    path: 'person/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/person-details/person-details.module').then(m => m.PersonDetailsPageModule)
  },
  {
    path: 'configs',
    loadChildren: () => import('src/apps/baseorient/content/admin/configs/configs.module').then(m => m.ConfigsPageModule)
  },
  {
    path: 'seasons',
    loadChildren: () => import('src/apps/baseorient/content/admin/seasons/seasons.module').then(m => m.SeasonsPageModule)
  },
  {
    path: 'subscriptions',
    loadChildren: () => import('src/apps/baseorient/content/admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsPageModule)
  },
  {
    path: 'result/:id',
    loadChildren: () => import('src/apps/baseorient/content/admin/result-detail/result-detail.module').then(m => m.ResultDetailPageModule)
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
