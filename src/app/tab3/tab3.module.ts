import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';

import { NgxEchartsModule } from 'ngx-echarts';
import { EchartsxModule } from 'echarts-for-angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab3Page }]),
    Tab3PageRoutingModule,
    EchartsxModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')})
  ],
  declarations: [Tab3Page]
})
export class Tab3PageModule {}
