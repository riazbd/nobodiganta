<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public count multiplier
    |--------------------------------------------------------------------------
    |
    | Read (view) and share counts shown on public pages are multiplied by this
    | factor for display only. Stored database values, increment logic, and the
    | admin panel are all unaffected. Set to 1 to show real counts.
    |
    */

    'public_count_multiplier' => (int) env('PUBLIC_COUNT_MULTIPLIER', 9),

];
