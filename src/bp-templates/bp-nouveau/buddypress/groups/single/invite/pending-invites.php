<?php
/**
 * BuddyBoss - Groups Send Invites
 *
 * @since BuddyPress 3.0.0
 * @version 3.0.0
 */

?>
<div id="group-invites-container">
	<?php bp_get_template_part( 'groups/single/parts/invite-subnav' ); ?>
	<div class="group-invites-column">
		<div class="subnav-filters group-subnav-filters bp-invites-filters">
			<div>
				<div class="group-invites-search subnav-search clearfix" role="search">
					<div class="bp-search">
						<form action="" method="get" id="group_invites_search_form" class="bp-invites-search-form" data-bp-search="group-invites">
							<label for="group_invites_search" class="bp-screen-reader-text"><?php bp_nouveau_search_default_text( __( 'Search Members', 'buddyboss' ), false ); ?></label>
							<input type="search" id="group_invites_search" placeholder="<?php esc_attr_e( 'Search Members', 'buddyboss' ); ?>"/>
							<button type="submit" id="group_invites_search_submit" class="nouveau-search-submit">
								<span class="dashicons dashicons-search" aria-hidden="true"></span>
								<span id="button-text" class="bp-screen-reader-text"><?php esc_html_e( 'Search Members', 'buddyboss' ); ?></span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

