import { Group } from './models/Group';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GroupResolverService } from './services/group-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: 'players', pathMatch: 'full' },
  { path: 'players', loadChildren: './pages/players/players.module#PlayersPageModule' },
  { path: 'group/:id', loadChildren: './pages/group/group.module#GroupPageModule', resolve: { GroupResolverService } },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
