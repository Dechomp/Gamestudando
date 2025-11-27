plugins {
    alias(libs.plugins.android.application)
    //id("com.android.application")
    //Vinculando o projeto ao firebase
    id("com.google.gms.google-services")
}

android {
    namespace = "com.example.gamestudando"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.gamestudando"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {

    //Importa o FireBase Bom
    implementation(platform("com.google.firebase:firebase-bom:34.4.0"))


    // TODO: Add the dependencies for Firebase products you want to use
    //Tradução: Adiciona as dependencias para os produtos firebase que você quer usar

    // When using the BoM, don't specify versions in Firebase dependencies
   // Tradução: Quando usar o BoM, não especifique versões nos dependências do Firebase
    implementation("com.google.firebase:firebase-analytics")


    // Add the dependencies for any other desired Firebase products
    // Tradução: Adicione as dependências para quaisquer outros produtos desejados do Firebase
    // https://firebase.google.com/docs/android/setup#available-libraries

    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation(libs.firebase.auth)
    implementation(libs.recyclerview)
    implementation(libs.firebase.firestore)
    implementation(libs.firebase.database)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")
}