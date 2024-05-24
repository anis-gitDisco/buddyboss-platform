<?php

declare( strict_types=1 );

use Symfony\Component\Finder\Finder;

$namespace = 'BuddyBossPlatform';

return [
	// The prefix configuration. If a non null value will be used, a random prefix will be generated.
	'prefix' => $namespace,
	'whitelist' => [
		// Excludes specific namespaces from being prefixed.
		'Composer\\*'
	],
	'finders' => [],
	'patchers' => [],
];
