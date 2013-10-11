<?php
/**
 * @file
 * Author Kristoffer Arrild Asmussen <k@arrild.com>
 */

/**
 * Menu callback for configuration page for Draw.
 */
function draw_admin_form($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('canvas_width' => 400, 'canvas_height' => 640, 'backgrounds' => array()));

  $form['images'] = array(
    '#type' => 'fieldset',
    '#title' => t('Available images'),
    '#collapsible' => TRUE,
    '#attributes' => array(
      'class' => array('draw-image-upload-repeat'),
    ),
    '#prefix' => '<div id="images-upload-wrapper">',
    '#suffix' => '</div>',
    '#description' => t('Add the images you want to allow the user to insert in the diagram.'),
  );


  // Build the fieldset with the proper number of names. We'll use
  // $form_state['num_names'] to determine the number of textfields to build.
  if (empty($form_state['num_images'])) {
    $form_state['num_images'] = empty($draw_settings['images']) ? 1 : count($draw_settings['images']);
  }

  for ($i = 0; $i < $form_state['num_images']; $i++) {
    $form['images']['img'][$i] = array(
      '#type' => 'managed_file',
      '#title' => t('Available image ' . $i),
      '#upload_validators'  => array('file_validate_extensions' => array('png gif jpg jpeg')),
      '#default_value' => empty($draw_settings['images'][$i]) ? NULL : $draw_settings['images'][$i],
      '#upload_location' => 'public://draw_images/',
    );
  }

  $form['images']['add_image'] = array(
    '#type' => 'submit',
    '#value' => t('Add one more'),
    '#submit' => array('draw_add_more_add_one'),
    '#ajax' => array(
      'callback' => 'draw_add_more_callback',
      'wrapper' => 'images-upload-wrapper',
    ),
  );

  if ($form_state['num_images'] > 1) {
    $form['images']['remove_image'] = array(
      '#type' => 'submit',
      '#value' => t('Remove one'),
      '#submit' => array('draw_add_more_remove_one'),
      '#ajax' => array(
        'callback' => 'draw_add_more_callback',
        'wrapper' => 'images-upload-wrapper',
      ),
    );
  }

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save settings'),
  );

    // No backgrounds on the background previews.
  $draw_settings['backgrounds'] = array('content' => array());
  drupal_add_js(array('draw_settings' => $draw_settings), 'setting');

  return $form;
}

/**
 * AJAX handler for image upload.
 */
function draw_add_more_add_one($form, &$form_state) {
  $form_state['num_images']++;
  $form_state['rebuild'] = TRUE;
}

function draw_add_more_callback($form, $form_state) {
  return $form['images'];
}

/**
 * Submit handler for draw_admin_form.
 */
function draw_admin_form_submit($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('backgrounds' => array()));

  
  // Save images.
  $draw_settings['images'] = array();
  for ($i=0; $i < $form_state['num_images']; $i++) {
    if (empty($form['images']['img'][$i])) {
      continue;
    }
    $form['images']['img'][$i]['#file']->status = 1;
    $file = file_save($form['images']['img'][$i]['#file']);
    $draw_settings['images'][] = $file->fid;
    file_usage_add($file, 'draw', 'file', $file->fid);
  }
  
  foreach ($form_state['values'] as $key => $val) {
    $draw_settings;
  }

  variable_set('draw_settings', $draw_settings);
}

function draw_background_form($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('backgrounds' => array()));
  $image_path = drupal_get_path('module', 'draw') . '/images';
  $create_image_uri = 'public://drupal_draw/';
  $path = drupal_get_path('module', 'draw') . '/js/';
  drupal_add_js($path . 'raphael-min.js');
  drupal_add_js($path . 'editor_base.js');
  drupal_add_js($path . 'draw_basic.js');


  $id = '';
  $content = '';
  $machine_name = '';
  $title = '';

  if (arg(5) != 'new_background') {
    $id = arg(5);
    $content = json_encode($draw_settings['backgrounds'][$id]['content']);
    $title = $draw_settings['backgrounds'][$id]['title'];
  }

  $form['background_title'] = array(
    '#type' => 'textfield',
    '#title' => t('Background title'),
    '#default_value' => $title,
  );

  $form['existing_id'] = array(
    '#type' => 'hidden',
    '#value' =>  $id, 
  );

  $form['drawing'] = array(
    '#type' => 'textarea',
    '#default_value' => $content,
    '#title' => t('Drawing'),
    '#prefix' => '<div id="draw-diagram" data-target_element="edit-drawing" data-image_path="' . $image_path . '"></div>',
    '#attributes' => array(
      'class' => array('draw-diagram-input'),
    ),
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );

  // No backgrounds on the background previews.
  unset($draw_settings['backgrounds']);
  drupal_add_js(array('draw_settings' => $draw_settings), 'setting');

  return $form;
}

function draw_background_form_submit($form, &$form_state) {
  $draw_settings = variable_get('draw_settings', array('backgrounds' => array()));

  $machine_name = empty($form_state['values']['existing_id']) ?
    htmlentities(strtolower(str_replace(' ', '_', $form_state['values']['background_title']))) :
    $form_state['values']['existing_id'];

  $draw_settings['backgrounds'][$machine_name] = array(
    'content' => json_decode($form_state['values']['drawing'], TRUE),
    'title' => $form_state['values']['background_title'],
  );

  $form_state['redirect'] = 'admin/config/content/drupal_draw';
  variable_set('draw_settings', $draw_settings);
}
