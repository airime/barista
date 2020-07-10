/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ThemeService } from '../../theme.service';
import { BaPageService } from '@dynatrace/shared/data-access-strapi';

@Component({
  selector: 'next-nav',
  templateUrl: 'nav.html',
  styleUrls: ['nav.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'next-nav',
  },
})
export class Nav {
  _navData$ = this._pageService._getCategories().subscribe((data) => {
    this._navItems = data;
    this._changeDetectorRef.detectChanges();
  });

  /** @internal Data needed to render the navigation. */
  _navItems: string[];

  dataloaded = false;

  constructor(
    public _themeService: ThemeService,
    private _pageService: BaPageService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}
}
