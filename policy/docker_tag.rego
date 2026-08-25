package docker.image

deny contains msg if {
    image := input.image
    endswith(image, ":latest")
    msg := sprintf("Docker image '%s' uses the prohibited latest tag. Use a versioned tag instead.", [image])
}

deny contains msg if {
    image := input.image
    not contains(image, ":")
    msg := sprintf("Docker image '%s' has no explicit tag. Use a versioned tag instead.", [image])
}
