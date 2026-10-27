use anyhow::{anyhow, Context};

/// Store a WebP image into the public shared storage under:
/// `/Documents/yu-gi-oh-home/` (optionally within a subfolder).
///
/// On Android 10+ (scoped storage), this uses MediaStore with `RELATIVE_PATH`,
/// which does not require broad storage permissions.
#[cfg(target_os = "android")]
pub fn store_webp_in_public_documents(
	display_name: &str,
	bytes: &[u8],
) -> anyhow::Result<String> {
	store_webp_in_public_documents_with_folder(display_name, bytes, None)
}

#[cfg(target_os = "android")]
pub fn store_webp_in_public_documents_with_folder(
	display_name: &str,
	bytes: &[u8],
	folder: Option<&str>,
) -> anyhow::Result<String> {
	if bytes.is_empty() {
		return Err(anyhow!("image bytes are empty"));
	}
	let display_name = display_name.trim();
	if display_name.is_empty() {
		return Err(anyhow!("display_name is empty"));
	}

	use jni::objects::{JObject, JString, JValue};
	use jni::JavaVM;

	let ctx = ndk_context::android_context();
	let vm = unsafe { JavaVM::from_raw(ctx.vm().cast()) }.context("failed to get JavaVM")?;
	let mut env = vm
		.attach_current_thread()
		.context("failed to attach current thread to JVM")?;

	let context = unsafe { JObject::from_raw(ctx.context() as jni::sys::jobject) };
	let content_resolver = env
		.call_method(
			context,
			"getContentResolver",
			"()Landroid/content/ContentResolver;",
			&[],
		)
		.context("failed to get ContentResolver")?
		.l()
		.context("ContentResolver is null")?;

	let media_columns_cls = env
		.find_class("android/provider/MediaStore$MediaColumns")
		.context("failed to find MediaStore$MediaColumns")?;
	let display_name_key = env
		.get_static_field(&media_columns_cls, "DISPLAY_NAME", "Ljava/lang/String;")
		.context("failed to read DISPLAY_NAME")?
		.l()?;
	let mime_type_key = env
		.get_static_field(&media_columns_cls, "MIME_TYPE", "Ljava/lang/String;")
		.context("failed to read MIME_TYPE")?
		.l()?;
	let relative_path_key = env
		.get_static_field(&media_columns_cls, "RELATIVE_PATH", "Ljava/lang/String;")
		.context("failed to read RELATIVE_PATH")?
		.l()?;
	let is_pending_key = env
		.get_static_field(&media_columns_cls, "IS_PENDING", "Ljava/lang/String;")
		.context("failed to read IS_PENDING")?
		.l()?;

	let content_values_cls = env
		.find_class("android/content/ContentValues")
		.context("failed to find ContentValues")?;
	let values = env
		.new_object(&content_values_cls, "()V", &[])
		.context("failed to create ContentValues")?;

	let j_display_name: JString = env
		.new_string(display_name)
		.context("failed to create display name string")?;
	let j_mime: JString = env
		.new_string("image/webp")
		.context("failed to create mime type string")?;
	let rel_path = match folder.map(str::trim).filter(|v| !v.is_empty()) {
		Some(folder_name) => format!("Documents/yu-gi-oh-home/{folder_name}"),
		None => "Documents/yu-gi-oh-home".to_string(),
	};
	let j_rel_path: JString = env
		.new_string(rel_path)
		.context("failed to create relative path string")?;

	// values.put(DISPLAY_NAME, display_name)
	env.call_method(
		&values,
		"put",
		"(Ljava/lang/String;Ljava/lang/String;)V",
		&[
			JValue::Object(&display_name_key),
			JValue::Object(&JObject::from(j_display_name)),
		],
	)
	.context("failed to put DISPLAY_NAME")?;

	// values.put(MIME_TYPE, image/webp)
	env.call_method(
		&values,
		"put",
		"(Ljava/lang/String;Ljava/lang/String;)V",
		&[
			JValue::Object(&mime_type_key),
			JValue::Object(&JObject::from(j_mime)),
		],
	)
	.context("failed to put MIME_TYPE")?;

	// values.put(RELATIVE_PATH, Documents/yu-gi-oh-home)
	env.call_method(
		&values,
		"put",
		"(Ljava/lang/String;Ljava/lang/String;)V",
		&[
			JValue::Object(&relative_path_key),
			JValue::Object(&JObject::from(j_rel_path)),
		],
	)
	.context("failed to put RELATIVE_PATH")?;

	let integer_cls = env
		.find_class("java/lang/Integer")
		.context("failed to find Integer")?;
	let one = env
		.call_static_method(
			&integer_cls,
			"valueOf",
			"(I)Ljava/lang/Integer;",
			&[JValue::Int(1)],
		)
		.context("failed to create Integer(1)")?
		.l()?;

	// values.put(IS_PENDING, 1)
	env.call_method(
		&values,
		"put",
		"(Ljava/lang/String;Ljava/lang/Integer;)V",
		&[JValue::Object(&is_pending_key), JValue::Object(&one)],
	)
	.context("failed to put IS_PENDING=1")?;

	let media_store_files_cls = env
		.find_class("android/provider/MediaStore$Files")
		.context("failed to find MediaStore$Files")?;
	let external = env
		.new_string("external")
		.context("failed to create external string")?;
	let collection_uri = env
		.call_static_method(
			&media_store_files_cls,
			"getContentUri",
			"(Ljava/lang/String;)Landroid/net/Uri;",
			&[JValue::Object(&JObject::from(external))],
		)
		.context("failed to get MediaStore Files collection URI")?
		.l()?;

	let inserted_uri = env
		.call_method(
			&content_resolver,
			"insert",
			"(Landroid/net/Uri;Landroid/content/ContentValues;)Landroid/net/Uri;",
			&[JValue::Object(&collection_uri), JValue::Object(&values)],
		)
		.context("failed to insert MediaStore row")?
		.l()?;

	if inserted_uri.is_null() {
		return Err(anyhow!("MediaStore insert returned null Uri"));
	}

	let output_stream = env
		.call_method(
			&content_resolver,
			"openOutputStream",
			"(Landroid/net/Uri;)Ljava/io/OutputStream;",
			&[JValue::Object(&inserted_uri)],
		)
		.context("failed to open output stream")?
		.l()?;

	if output_stream.is_null() {
		return Err(anyhow!("openOutputStream returned null"));
	}

	let j_bytes = env
		.byte_array_from_slice(bytes)
		.context("failed to create jbyteArray")?;
	let j_bytes_obj = JObject::from(j_bytes);

	env.call_method(
		&output_stream,
		"write",
		"([B)V",
		&[JValue::Object(&j_bytes_obj)],
	)
	.context("failed to write bytes")?;
	env.call_method(&output_stream, "flush", "()V", &[])
		.context("failed to flush")?;
	env.call_method(&output_stream, "close", "()V", &[])
		.context("failed to close")?;

	// Mark as not pending so other apps can see the file.
	let values2 = env
		.new_object(&content_values_cls, "()V", &[])
		.context("failed to create ContentValues (2)")?;
	let zero = env
		.call_static_method(
			&integer_cls,
			"valueOf",
			"(I)Ljava/lang/Integer;",
			&[JValue::Int(0)],
		)
		.context("failed to create Integer(0)")?
		.l()?;

	env.call_method(
		&values2,
		"put",
		"(Ljava/lang/String;Ljava/lang/Integer;)V",
		&[JValue::Object(&is_pending_key), JValue::Object(&zero)],
	)
	.context("failed to put IS_PENDING=0")?;

	let null_obj = JObject::null();
	let _updated = env
		.call_method(
			&content_resolver,
			"update",
			"(Landroid/net/Uri;Landroid/content/ContentValues;Ljava/lang/String;[Ljava/lang/String;)I",
			&[
				JValue::Object(&inserted_uri),
				JValue::Object(&values2),
				JValue::Object(&null_obj),
				JValue::Object(&null_obj),
			],
		)
		.context("failed to update IS_PENDING")?;

	let uri_jobj = env
		.call_method(&inserted_uri, "toString", "()Ljava/lang/String;", &[])
		.context("failed to convert uri to string")?
		.l()?;
	let uri_jstr = JString::from(uri_jobj);
	let rust_uri = env
		.get_string(&uri_jstr)
		.map(|s| s.to_string_lossy().to_string())
		.context("failed to read uri string")?;

	if rust_uri.is_empty() {
		return Err(anyhow!("empty uri string"));
	}
	Ok(rust_uri)
}


pub fn store_image_in_public_documents_with_folder(display_name: &str, bytes: &[u8], folder_name: Option<&str>) -> anyhow::Result<String> {
\tstore_webp_in_public_documents_with_folder(display_name, bytes, folder_name)
}

pub fn store_image_in_public_documents(display_name: &str, bytes: &[u8]) -> anyhow::Result<String> {
\tstore_webp_in_public_documents(display_name, bytes)
}