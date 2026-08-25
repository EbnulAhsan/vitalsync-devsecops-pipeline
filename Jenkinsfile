pipeline {
    agent any

    environment {
        IMAGE_NAME = 'vitalsync-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Build and Unit Test') {
            steps {
                sh 'npm run build'
                sh 'npm test -- --coverage --ci'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'vitalsync-database-url', variable: 'DATABASE_URL'),
                    string(credentialsId: 'vitalsync-jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    sh '''
                    docker rm -f vitalsync-backend-auto || true

                    docker run -d \
                      --name vitalsync-backend-auto \
                      --network vitalsync-network \
                      -e DATABASE_URL="$DATABASE_URL" \
                      -e JWT_SECRET="$JWT_SECRET" \
                      -e PORT=5000 \
                      -e NODE_ENV=production \
                      -p 5001:5000 \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }
    }
}
