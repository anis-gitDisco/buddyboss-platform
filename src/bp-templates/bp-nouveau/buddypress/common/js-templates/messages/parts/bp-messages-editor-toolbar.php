<?php
/**
 * BP Nouveau messages editor toolbar
 *
 * This template can be overridden by copying it to yourtheme/buddypress/messages/parts/bp-messages-editor-toolbar.php.
 *
 * @since   1.0.0
 * @version 1.0.0
 */
?>

<script type="text/html" id="tmpl-whats-new-messages-toolbar">

<?php if ( ! bp_is_active( 'media' ) ) : ?>
<div class="media-off">
<?php endif; ?>

	<?php if ( bp_is_active( 'media' ) ) : ?>

		<div class="post-elements-buttons-item show-toolbar"  data-bp-tooltip-pos="down-left" data-bp-tooltip="<?php esc_attr_e( 'Show formatting', 'buddyboss' ); ?>" data-bp-tooltip-hide="<?php esc_attr_e( 'Hide formatting', 'buddyboss' ); ?>" data-bp-tooltip-show="<?php esc_attr_e( 'Show formatting', 'buddyboss' ); ?>">
			<a href="#" id="show-toolbar-button" class="toolbar-button bp-tooltip">
				<span class="bb-icons-l bb-icon-font"></span>
			</a>
		</div>

		<div class="post-elements-buttons-item post-media post-media-photo-support">
			<a href="#" id="messages-media-button" class="toolbar-button bp-tooltip" data-bp-tooltip-pos="down" data-bp-tooltip="<?php esc_attr_e( 'Attach photo', 'buddyboss' ); ?>">
				<i class="bb-icons-l bb-icon-camera"></i>
			</a>
		</div>

		<?php
		$video_extensions = bp_video_get_allowed_extension();
		if ( ! empty( $video_extensions ) ) :
			?>
            <div class="post-elements-buttons-item post-video post-media-video-support">
                <a href="#" id="messages-video-button" class="toolbar-button bp-tooltip" data-bp-tooltip-pos="down" data-bp-tooltip="<?php esc_attr_e( 'Attach video', 'buddyboss' ); ?>">
                    <i class="bb-icons-l bb-icon-video"></i>
                </a>
            </div>
		<?php endif; ?>

		<?php
		$extensions = bp_document_get_allowed_extension();
		if ( ! empty( $extensions ) ) :
			?>
			<div class="post-elements-buttons-item post-media post-media-document-support">
				<a href="#" id="messages-document-button" class="toolbar-button bp-tooltip" data-bp-tooltip-pos="down" data-bp-tooltip="<?php esc_attr_e( 'Attach document', 'buddyboss' ); ?>">
					<i class="bb-icons-l bb-icon-file-attach"></i>
				</a>
			</div>
		<?php endif; ?>

		<div class="post-elements-buttons-item post-gif post-media-gif-support">
			<div class="gif-media-search">
				<a href="#" id="messages-gif-button" class="toolbar-button bp-tooltip" data-bp-tooltip-pos="down" data-bp-tooltip="<?php esc_attr_e( 'Choose a GIF', 'buddyboss' ); ?>">
					<i class="bb-icons-l bb-icon-gif"></i>
				</a>
				<div class="gif-media-search-dropdown"></div>
			</div>
		</div>

		<div class="post-elements-buttons-item post-emoji bp-tooltip post-media-emoji-support" data-bp-tooltip-pos="down" data-bp-tooltip="<?php esc_attr_e( 'Emoji', 'buddyboss' ); ?>"></div>


	<?php endif; ?>

<?php if ( ! bp_is_active( 'media' ) ) : ?>
</div>
<?php endif; ?>

</script>
