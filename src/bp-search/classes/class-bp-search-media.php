<?php
/**
 * @todo add description
 *
 * @package BuddyBoss\Search
 * @since BuddyBoss 1.5.0
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Bp_Search_Media' ) ) :

	/**
	 * BuddyPress Global Search  - search media class
	 */
	class Bp_Search_Media extends Bp_Search_Type {
		private $type = 'photos';

		/**
		 * Insures that only one instance of Class exists in memory at any
		 * one time. Also prevents needing to define globals all over the place.
		 *
		 * @since BuddyBoss 1.5.0
		 *
		 * @return object Bp_Search_Media
		 */
		public static function instance() {
			// Store the instance locally to avoid private static replication.
			static $instance = null;

			// Only run these methods if they haven't been run previously.
			if ( null === $instance ) {
				$instance = new Bp_Search_Media();
			}

			// Always return the instance.
			return $instance;
		}

		/**
		 * A dummy constructor to prevent this class from being loaded more than once.
		 *
		 * @since BuddyBoss 1.4.0
		 */
		private function __construct() {
			/* Do nothing here */
		}

		public function sql( $search_term, $only_totalrow_count = false ) {

			global $wpdb, $bp;
			$query_placeholder = array();

			$user_groups = array();
			if ( bp_is_active( 'groups' ) ) {

				// Fetch public groups.
				$public_groups = groups_get_groups(
					array(
						'fields'   => 'ids',
						'status'   => 'public',
						'per_page' => - 1,
					)
				);
				if ( ! empty( $public_groups['groups'] ) ) {
					$public_groups = $public_groups['groups'];
				} else {
					$public_groups = array();
				}

				$user_groups = array();
				if ( is_user_logged_in() ) {

					$groups = groups_get_user_groups( bp_loggedin_user_id() );
					if ( ! empty( $groups['groups'] ) ) {
						$user_groups = $groups['groups'];
					} else {
						$user_groups = array();
					}
				}

				$user_groups = array_unique( array_merge( $user_groups, $public_groups ) );
			}

			$friends = array();
			if ( bp_is_active( 'friends' ) && is_user_logged_in() ) {

				// Determine friends of user.
				$friends = friends_get_friend_user_ids( bp_loggedin_user_id() );
				if ( empty( $friends ) ) {
					$friends = array( 0 );
				}
				array_push( $friends, bp_loggedin_user_id() );
			}


			$sql = ' SELECT ';

			if ( $only_totalrow_count ) {
				$sql .= ' COUNT( DISTINCT m.id ) ';
			} else {
				$sql .= $wpdb->prepare(" DISTINCT m.id, 'photos' as type, m.title LIKE %s AS relevance, m.date_created as entry_date  ", '%' . $wpdb->esc_like( $search_term ) . '%' );
			}

			$sql .= " FROM {$bp->media->table_name} m WHERE";

			$privacy = array( 'public' );
			if( is_user_logged_in() ) {
				$privacy[] = 'loggedin';
			}

			$sql .= $wpdb->prepare(
				" (
					(
						m.title LIKE %s
					)
					AND
					(
							( m.privacy IN ( '" . implode( "','", $privacy ) . "' ) ) " .
							( isset( $user_groups ) && ! empty( $user_groups ) ? " OR ( m.group_id IN ( '" . implode( "','", $user_groups ) . "' ) AND m.privacy = 'grouponly' )" : '' ) .
							( bp_is_active( 'friends' ) && ! empty( $friends ) ? " OR ( m.user_id IN ( '" . implode( "','", $friends ) . "' ) AND m.privacy = 'friends' )" : '' ) .
							( is_user_logged_in() ? " OR ( m.user_id = '" . bp_loggedin_user_id() . "' AND m.privacy = 'onlyme' )" : '' ) .
					")
				)",
				'%' . $wpdb->esc_like( $search_term ) . '%'
			);

			return apply_filters(
				'bp_search_photos_sql',
				$sql,
				array(
					'search_term'         => $search_term,
					'only_totalrow_count' => $only_totalrow_count,
				)
			);
		}

		protected function generate_html( $template_type = '' ) {
			$document_ids = array();
			foreach ( $this->search_results['items'] as $item_id => $item_html ) {
				$document_ids[] = $item_id;
			}

			// now we have all the posts
			// lets do a media loop
			$args = array(
				'include'      => implode( ',', $document_ids ),
				'per_page'     => count( $document_ids ),
				'search_terms' => false,
			);

			do_action( 'bp_before_search_photos_html' );

			if ( bp_has_media( $args ) ) {

				while ( bp_media() ) :
					bp_the_media();

					$result = array(
						'id'    => bp_get_media_id(),
						'type'  => $this->type,
						'title' => bp_get_media_title(),
						'html'  => bp_search_buffer_template_part( 'loop/photos', $template_type, false ),
					);

					$this->search_results['items'][ bp_get_media_id() ] = $result;
				endwhile;
			}

			do_action( 'bp_after_search_photos_html' );
		}
	}

	// End class Bp_Search_Media.

endif;

